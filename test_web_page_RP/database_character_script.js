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
	select_charater(0)
	function select_charater(character_id){
		try{
			const PGinfo_str = `<strong>Name: </strong> ${ data_json[character_id].name} <br>
			<strong>Race: </strong> ${ data_json[character_id].race} <br>
			<strong>Class: </strong> ${ data_json[character_id].class} <br>`
			document.getElementById("PGinfo").innerHTML=PGinfo_str
			document.getElementById("pg_imm").src=data_json[character_id].image
			document.getElementById("Background").innerHTML=data_json[character_id].bg

			let classes_txt =""
			data_json[character_id].classes.forEach((sqn_classes)=>{
				classes_txt +='<li>'+Object.keys(sqn_classes).toString()+'</li><ul>'
				sqn_classes[Object.keys(sqn_classes).toString()].forEach((talent)=>{
					classes_txt += "<li>"+Object.keys(talent)+": " + Object.values(talent) +"</li>"
				})
				classes_txt+="</ul>"
			})
			document.getElementById("list_classes").innerHTML=classes_txt
		}catch(error){console.log('error in select character')}
	}
//	console.log(data_json[0].stat.dex)

//	const PGClass = Object.keys(data_json[0].classes[0])
//	console.log(
//`Main Class ${PGClass} 
//Skill 1 ${Object.keys(data_json[0].classes[0][PGClass][0])}: ${Object.values(data_json[0].classes[0][PGClass][0])}`
//	)
})();