( async function (){

    // si trova in js/js_consts.js
    // const signaling_server = "http://localhost/html/signaling_server/signaling_server.php";
    const rooms_list = document.getElementById("rooms_container");
    var num_of_rooms = 0;
    var current_json_rooms_list = "";   // Serve allo script per capire quando aggiornare le rooms 

    /*
    * Restituisce la lista delle room in json
    */
    function get_rooms_list_from_server( is_create_rooms, is_check ){

        fetch( signaling_server + '?cmd=get_rooms_list')
        .then(async response => {
            try {
                const data = await response.json()
                //console.log('response data: \n',  JSON.parse(data) )
                json_rooms_list = JSON.parse( data );
                console.log( json_rooms_list );
                
                // genera le rooms html
                if( is_create_rooms ) create_rooms_list( json_rooms_list );
                
                // controlla se sono state aggiunte o tolte rooms dalla json rooms list
                if( is_check ){

                    // controlla se la current json rooms list è uguale alla json rooms list ottenuta dal server
                    if( JSON.stringify( current_json_rooms_list ) !=  JSON.stringify( json_rooms_list ) ){

                        console.log( JSON.stringify( current_json_rooms_list )  + " != " + JSON.stringify( json_rooms_list ) );
                        
                        // aggiorna la current json rooms list
                        current_json_rooms_list = json_rooms_list;
                        
                        // aggiorna le rooms html
                        update_rooms();
                    }
                }

           } catch(error) {
                console.log('Error happened here!')
                console.error(error)
           }
        });
    }

    /*
    * Aggiunge un listener per unirsi ad una room
    */
    function add_on_click_listener_to_join_room_bts (){

        for( let i = 0; i < num_of_rooms; i ++ ){

            // var room_name = document.getElementById("room_name_" + i );
            // var room_psw = document.getElementById("room_psw_" + i );
            // var room_comment = document.getElementById("room_comment_" + i );
            
            // var psw_input = document.getElementById("psw_input_" + i);
            // var room_id = document.getElementById("room_id_" + i).innerText;


            var room_bt_join = document.getElementById( /* "room_bt_join_" + */ i );

            // console.log("ID BUTTON ---> " + room_bt_join.id + " ; Room id --->" + room_id );
            if(  typeof room_bt_join !== 'undefined' /* && typeof psw_input !== 'undefined' */ ){

                room_bt_join.onclick = e => {

                    var psw_input = document.getElementById("psw_input_" + e.target.id );
                    var room_id = document.getElementById("room_id_" + e.target.id ).innerText;
                    
                    console.log("On Join Button Click : ID BUTTON ---> " + room_bt_join.id + " ; Room id --->" + room_id 
                        + " ; Room psw ---> " + psw_input.value );

                    // console.log("Event ---> " + e.target.id );

                    fetch( signaling_server + "?cmd=check_answer&room_id=" + room_id + "&room_psw=" + psw_input.value )
                    .then( async resp => { 
                        var data = await resp.json() ;
                        var jo_answ = JSON.parse(data);
                        console.log( jo_answ );
                        if( jo_answ["room_answer"] == "NULL" || jo_answ["room_answer"] == "null" ){

                            self.location.href = "answer_room.html?room_id=" + room_id + "&room_psw=" + psw_input.value
                            + "&room_index=" + e.target.id ;
                        } else {
                            // Stampa messaggi di errore
                            if( jo_answ["room_answer"] == "wrong_psw" ) alert("Acced Denied: Wrong Password");
                            else alert("Room Not Available");
                        }
                    });




                }


            }
        }

    }

    /*
    * genera la lista delle rooms
    */
    function create_rooms_list( json_rooms_list ){

        // creazione delle rooms 
        if( typeof json_rooms_list !== 'undefined' ){

            num_of_rooms = 0;

            for( let i = 0; ; i ++ ){

                // Se non è stata recuperata nessuna room lists
                // non stampa nulla
                if( json_rooms_list[i] === undefined ) break;
        
                num_of_rooms ++;

                var room = document.createElement("div");

                // var room_name = document.createElement("span");
                var room_name = document.createElement("div");
                room_name.style.marginBottom = "10px";
                room_name.class = "room_element"; // non serve
                room_name.id= "room_name_" + i;
                room_name.innerHTML = "<b>Room Id :</b> " ; // + json_rooms_list[i]["room_id"] ;

                // creo un elemento che contiene l'id della room
                var room_id = document.createElement("span");
                room_id.id= "room_id_" + i;
                room_id.innerText = json_rooms_list[i]["room_id"] ;

                // usa l'id della room per generare il room name
                room_name.appendChild( room_id );


                // var room_psw = document.createElement("span");
                var room_psw = document.createElement("div");
                room_psw.style.marginBottom = "10px";
                room_psw.class = "room_element"; // non serve
                room_psw.id = "room_psw_" + i;
                var psw_label = document.createElement("span");
                psw_label.innerHTML = "<b>Psw :</b> ";
                var psw_input = document.createElement("input");
                psw_input.type = "password";
                psw_input.id = "psw_input_" + i;
                room_psw.appendChild( psw_label );
                room_psw.appendChild( psw_input );


                // var room_comment = document.createElement("span");
                var room_comment = document.createElement("div");
                room_comment.style.marginBottom = "10px";
                room_comment.style.overflow = "hidden";
                room_comment.class = "room_element"; // none serve
                room_comment.id = "room_comment_" + i;
                room_comment.innerHTML = "<b>Room Description : </b> " + json_rooms_list[i]["room_desc"] + " ";//=" Unisciti alla mia room! ";

                var room_bt_join = document.createElement("button");
                room_bt_join.class = "room_element"; // non serve
                room_bt_join.id = /*"room_bt_join_" + */ i;
                room_bt_join.innerHTML = "JOIN";
                // room_bt_join.onclick = () => { self.location.href = "room.html" };
                // room_bt_join.onclick = () => { self.location.href = "answer_room.html" };

                room.appendChild( room_name );
                room.appendChild( room_comment );
                room.appendChild( room_psw );
                room.appendChild( room_bt_join );

                room.style.backgroundColor = "lightblue";
                room.style.padding = "15px 5px";
                room.style.marginBottom = "10px";

                
                rooms_list.appendChild( room );
                // resize_room_components();
            }

            // aggiunge gli onclick listeners
            add_on_click_listener_to_join_room_bts();
        }
            
    }

    // create_rooms_list();
    get_rooms_list_from_server( true , false );


    /*
    *   Cancella tutti gli elementi della rooms_list
    *    e ne crea di nuovi secondo la nuova json_rooms_list 
    */
   function update_rooms(){

        console.log("update rooms");    

        // rimuove tutte le room presenti
        while( rooms_list.firstChild ) rooms_list.removeChild( rooms_list.lastChild );

        // genera ed inserisce le nuove rooms secondo il signaling server
        // parametri passati
        // is_create_room = false & is_check_rooms = true
        get_rooms_list_from_server( true, false );
   }

    // Ogni tot di sec, se la rooms list è cambiata, aggiorna le rooms html
    ( async function () {

            while( true ){

                // aspetta un tot di sec
                await new Promise(resolve => setTimeout(resolve, 3000));

                // parametri passati
                // is_create_room = false & is_check_rooms = true
                get_rooms_list_from_server( false, true );
                
        }
    }) ();

} )();