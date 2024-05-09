const fs = require( 'node:fs/promises');
const path = require( 'node:path' );
const yaml = require( 'js-yaml' );
const fm = require('front-matter');


const directoryPath = '.\\src\\pages';
const sitemap = [`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`];
const JSON_path = { meta:{}, children: {} };

async function JSON_maker ( dir ) {
    const dir_content = await fs.readdir( dir )
    if ( dir_content ) {
        for (const file of dir_content) {
            const path = dir + '\\' + file;
            if ( (await fs.lstat( path )).isFile()) {
                if ( file.endsWith(".md") || file.endsWith(".html") ) {
                    // sitemap 
                    sitemap.push( `
<urlset ${path.replace(".\\src\\pages\\", "https://tanil89.github.io/#!").replace("\\","/").replace(".md", "").replace(".html", "")}>
    <url>
        <loc> "https://tanil89.github.io/"
    </url>
</urlset>` );  
                    // json
                    const yaml_data = await readYAML( path );
                    const link = path.replace(".\\src\\", "")
                    path_split = link.replace("pages\\", "").split( '\\' );
                    add_to_JSON( JSON_path, path_split, link, yaml_data );
                }
            } else {
                await JSON_maker( path );
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
    for (const file of await fs.readdir( 'dist' )) {
        await fs.unlink(path.join( 'dist', file));
    }
    await fs.cp("src", "dist", {recursive: true})

    JSON_path.meta = JSON.parse( await fs.readFile( directoryPath + "//meta.json", 'utf8' ));
    await JSON_maker(directoryPath);
    fs.writeFile( "dist\\index.json", JSON.stringify(JSON_path, null, "\t"), 'utf8');
    fs.writeFile( "dist\\sitemap.xml", sitemap.join("\n"), 'utf8');
})();