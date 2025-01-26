<?php

    // Orlando Parente 0227408

    // Funzioni di supporto per il server di signaling

    /*
    * Recupera la rooms list da file
    */
    function load_rooms_list_from_file() {
        // if( file_exists("json_rooms_list.json") ) $file_json_rooms_list = fopen("json_rooms_list.json","r");
        // else $file_json_rooms_list = fopen("json_rooms_list.json","w+");
        
        if( !file_exists("json_rooms_list.json") || filesize( "json_rooms_list.json" ) == 0 ){
            $json_rooms_list = "[]";
            // $file_json_rooms_list = fopen("json_rooms_list.json","x+");
        } else{
            $file_json_rooms_list = fopen("json_rooms_list.json","r");
            //$json_rooms_list = fread( $file_json_rooms_list, filesize( "json_rooms_list.json" ) );
            
            $json_rooms_list = "";
            while( !feof( $file_json_rooms_list ) ){ 
                $json_rooms_list.=fgetc( $file_json_rooms_list ); 
            }

            fclose( $file_json_rooms_list );
        }

        // fclose( $file_json_rooms_list );
        // return json_decode( $json_rooms_list , true );
        // print_r( "<br>".$json_rooms_list."<br>" );
        return $json_rooms_list;
    }

    /*
    * Sovrascrivere l'attuale rooms list su file
    */
    function save_rooms_list_in_file( $json_rooms_list ){
        
        $file_json_rooms_list = fopen("json_rooms_list.json","w");

        // impedisce di accedere al file mentre vi si sta scrivendo
        // print_r("LOCKING");
        flock( $file_json_rooms_list, LOCK_EX );
        

            fwrite( $file_json_rooms_list, /*json_encode(*/ $json_rooms_list/*)*/ );
        
        
        // sblocca l'accesso al file
        // print_r("UN_LOCKING");
        flock( $file_json_rooms_list, LOCK_UN );
        
        fclose( $file_json_rooms_list );

    }

    /*
    * Ritorna l'ultimo id usato
    */
    function get_last_room_id() {

        $room_id = 0;
        $json_rooms_list = json_decode( load_rooms_list_from_file() ,true );
        // print_r( $json_rooms_list );

        if( $json_rooms_list != null ){

            foreach ( $json_rooms_list as $json_obj ){
                // echo $json_obj->room_id."<br>";
                // echo json_encode($json_obj) ."<br>";
                
                $room_id = $json_obj["room_id"];
            }
            
        }

        return $room_id;
    }

    /*
    * Ritorna una stringa formato JSON della room,
    * costruita sui parametri passati
    *
    * se conf = "no_psw" non mostra le passwords delle rooms
    */
    function create_room( $room_psw = "" , $offer, $room_desc = ""  , $answer = "null", $room_id = "" , $conf = "" ){
        
        if( $room_id == "" ) $room_id = get_last_room_id() + 1;

        $room_str = '{ "room_id" : "'.$room_id.'"';
        
        // non mostra la password se la configurazione è "no_psw"
        if( $conf != "no_psw") $room_str .=' , "room_psw" : "'.$room_psw.'"';
        
        $room_str .=', "room_desc" : "'.$room_desc.'" ,';
        $room_str .= '"sdp_offer" : '.json_encode($offer).', "sdp_answer" : '.json_encode($answer).' }';

        return $room_str;
        
    }

    /*
     * Genera una nuova new_rooms_list con la nuova room
     * e la salva su file 
     */
    function add_new_room_to_rooms_list( $new_room ){

        // ---- crea la nuova rooms list ---
        $new_rooms_list = "[";
        $json_romms_list = json_decode( load_rooms_list_from_file() );

        if( $json_romms_list != null )
            foreach ( $json_romms_list as $json_obj )
                $new_rooms_list.= json_encode($json_obj) .",";

        $new_rooms_list .= $new_room;
        $new_rooms_list .= "]";
        // ---------------------------------

        save_rooms_list_in_file( $new_rooms_list );

        // echo "<br><br>";
        // print_r( "<br> add_new_room_to_rooms_list -> ".$new_rooms_list );

    }

    /*
    *
    */
    function get_room_from_id ( $room_id ){

        $json_rooms_list = json_decode( load_rooms_list_from_file() , true );

        if( $json_rooms_list !== 'undefined' && $json_rooms_list != null )
            foreach( $json_rooms_list as $room ) 
                if( $room["room_id"] == $room_id )
                    return $room;

        // room non trovata
        return "null";
    }

    /*
    * Aggiorna l'sdp_answer di una room
    *
    * di default, la aggiorna a null
    */
    function update_sdp_answer( $room_id, $room_psw, $answer = "null" ){

        $json_rooms_list = json_decode( load_rooms_list_from_file() , true );

        // ---- crea la nuova rooms list ---
        $new_rooms_list = "[";

        $add_comma = false;

        if( $json_rooms_list != null ){
            foreach ( $json_rooms_list as $room ){

                // se è la prima room non aggiunge la virgola
                if( $add_comma ) $new_rooms_list .= ",";
                else $add_comma = true;

                if( $room["room_id"] == $room_id && $room["room_psw"] == $room_psw ){
                    $updated_room = create_room( $room_psw , $room["sdp_offer"] , $room["room_desc"] , $answer , $room_id );
                    $new_rooms_list.= $updated_room; 
                    // print_r( $updated_room );
                } else { 
                    $new_rooms_list.= json_encode($room) ;
                }
            }
        }

        $new_rooms_list .= "]";
        // ---------------------------------

        save_rooms_list_in_file( $new_rooms_list );
    }

    /*
     * Restituisce la rooms_list MA senza mostrare le passwords
     */
    function get_rooms_list_without_passwords(){

        $json_rooms_list = json_decode( load_rooms_list_from_file() ,true );

        $rooms_list = "[";

        $add_comma = false;

        if( $json_rooms_list != null ) {

            foreach( $json_rooms_list as $room ){

                // se non è la prima room, aggiunge la virgola
                if( $add_comma ) $rooms_list.=",";
                else $add_comma = true;

                $room_psw = $room["room_psw"];
                $offer = $room["sdp_offer"];
                $room_desc = $room["room_desc"];
                $answer = $room["sdp_answer"];
                $room_id = $room["room_id"];

                $rooms_list .= create_room( $room_psw , $offer, $room_desc , $answer , $room_id  , "no_psw" );
                // $rooms_list .= "<br>";
            }

        } else {
            // errore 
        }

        $rooms_list .= "]";

        return $rooms_list;
    }