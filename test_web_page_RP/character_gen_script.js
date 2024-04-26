console.clear()

const link_character = document.getElementById('character_link_list');
;(async ()=>{
	const data_json = await (await fetch('./BG.json')).json()
	data_json.forEach((character, index)=>{
		const link = document.createElement('a');
		link.href='#'
		link.textContent=character.name;
		link.addEventListener('click', ()=> select_charater(index));
		const list_item = document.createElement('li');
		list_item.appendChild(link);
		link_character.appendChild(list_item);
	})
	function select_charater(character_id){
			try{
				window.location.href="database_character.html"
				const PGinfo_str = `<strong>Name: </strong> ${ data_json[character_id].name} <br>
				<strong>Race: </strong> ${ data_json[character_id].race} <br>
				<strong>Class: </strong> ${ data_json[character_id].class} <br>`
				document.getElementById("PGinfo").innerHTML=PGinfo_str
				document.getElementById("pg_imm").src=data_json[character_id].image
				document.getElementById("Background").innerHTML=data_json[character_id].bg
			}catch(error){console.log('error in select character')}
		}
})();