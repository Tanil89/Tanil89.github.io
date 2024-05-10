const fs = require( 'node:fs/promises');
const path = require( 'node:path' );
const yaml = require( 'js-yaml' );
const fm = require('front-matter');


const directoryPath = './src/pages';
const sitemap = [`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`];
const JSON_path = { meta:{}, children: {} };

async function JSON_maker ( dir, pages) {
    const dir_content = await fs.readdir( dir )
    if ( dir_content ) {
        for (const file of dir_content) {
            const path = dir + '/' + file;
            if ( (await fs.lstat( path )).isFile()) {
                if ( file.endsWith(".md") || file.endsWith(".html") ) {
                    const yaml_data = await readYAML( path );
                    pages.push( [path, yaml_data] );
                }
            } else {
                await JSON_maker( path, pages );
            }
        }
    }
}

async function readYAML ( path ) {
    const text = await fs.readFile( path, 'utf8');
    const YAML = fm( text );
    return YAML;
}

function add_to_JSON(JSON_path, path_split, link, YAML) {
    let cursor = JSON_path
    for ( const key in path_split ) {
        const e = path_split[key].replace(".md", "").replace(".html", "");
        cursor = cursor.children
        cursor[e] = cursor[e] || {}
        cursor[e].children = cursor[e].children || {}
        cursor = cursor[e]
    }
    if ( Object.keys(cursor.children).length == 0 ) {
        delete cursor.children;
    }
    if ( YAML.body.trim().length > 0 ) {
        Object.assign(cursor, {link: link});
    }
    cursor.meta = {}
    Object.assign(cursor.meta, YAML.attributes);
}

;(async () => {
    //for (const file of await fs.readdir( 'dist' )) {
    //    await fs.unlink(path.join( 'dist', file));
    //}
    
    try { 
        await fs.rm("dist", {recursive: true}) 
    } catch (e) {}
    await fs.mkdir("dist")
    await fs.cp("src", "dist", {recursive: true})
    JSON_path.meta = JSON.parse( await fs.readFile( directoryPath + "/meta.json", 'utf8' ));

    let pages = []
    await JSON_maker(directoryPath, pages);
    pages = pages.sort( (a, b) => {
        const lenRoute = a[0].split('/').length - b[0].split('/').length
        if ( lenRoute ) return lenRoute;

        const index = ( a[1]?.attributes?.index || Number.MAX_VALUE ) - ( b[1]?.attributes?.index || Number.MAX_VALUE )
        if ( index ) return index;

        const date = ( a[1]?.attributes?.date || Number.MAX_VALUE ) - ( b[1]?.attributes?.date || Number.MAX_VALUE )
        if ( date ) return -date;

        if ( a[0] !== b[0] ) return [a[0], b[0]].sort()[0] === a[0] ? -1 : 1
    })
    const dictSearch = []
    pages.forEach( ([path, yaml_data], i) => {
        // sitemap 
        sitemap.push( `
            <urlset ${path.replace("./src/pages/", "https://tanil89.github.io/#!").replace(/\.\w+$/, '')}>
                <url>
                    <loc> "https://tanil89.github.io/"
                </url>
            </urlset>`
        );

        // json
        const link = path.replace("./src/", "")
        path_split = link.replace("pages/", "").split( '/' );
        add_to_JSON( JSON_path, path_split, link, yaml_data );

        // search list
        dictSearch.push( {
            id: i,
            str: getPageName(yaml_data?.attributes) + ' ' + path_split.at(-1).replace(/\.\w+$/, '') + ' ' + Object.values( yaml_data?.attributes ).join(' ') + ' ' + path_split.slice(0, -1).reverse().join(' '),
            name: ( getPageName(yaml_data?.attributes) || path_split.at(-1)?.replace(/\.\w+$/, '').replace(/_/g, ' ' )) + (path_split.at(-2) ? (' (' + path_split.at(-2)?.replace(/\.\w+$/, '') + ')' ) : ''),
            url: path.replace("./src/pages/", "").replace(/\.\w+$/, '')
        })
    })


    fs.writeFile( "src/index.json", JSON.stringify(JSON_path, null, "\t"), 'utf8');
    fs.writeFile( "src/sitemap.xml", sitemap.join("\n"), 'utf8');
    fs.writeFile( "src/search.json", JSON.stringify(dictSearch, null, "\t"), 'utf8');
})();

function getPageName (page) {
    return page?.title || page?.name || ''
}