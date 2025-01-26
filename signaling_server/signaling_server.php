<?php
    header("Content-type: application/json");
    header("Access-Control-Allow-Origin:*");  // NOTA: scrivere tutto attaccato altrimente non funziona
    // header("Access-Control-Allow-Headers: X-Requested-With");
    // header("Access-Control-Allow-Credentials:true");
    // header("Content-type: application/javascript");
    // header("Access-Control-Allow-Headers:Content-Type, Accept");
    // header("Access-Control-Allow-Credentials:true");
  
    /*
    header("Access-Control-Allow-Credentials : true");
    header("Access-Control-Allow-Methods : GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers : Origin, Content-Type, Accept");
    */
    
    // Orlando Parente 0227408

    require("utils.php");

    // recupero comando
    if( isset($_GET["cmd"]) ) $cmd = $_GET["cmd"];
    else $cmd = "";


    switch( $cmd ){

        // il peerA invia l' SDP Offer
        case "create_room":
            // if( isset( $_GET["offer"] ) ){
            if( isset( $_GET["offer"] ) || isset( $_POST["offer"] ) ){
                
                // ----- echo json_encode( $_POST["offer"] );
                // echo $_POST["offer"];
                
                // Inizializzazione della variabili necessarie  ----
                if( isset( $_GET["offer"] ) ) $offer = $_GET["offer"]; 
                if( isset( $_POST["offer"] ) ) $offer = $_POST["offer"];

                if( isset( $_GET["room_description"] ) ) $room_desc = $_GET["room_description"];
                else $room_desc = "";

                if( isset( $_GET["room_psw"] ) ) $room_psw = $_GET["room_psw"];
                else $room_psw = "";
                // -------------------------------------------------


                // $offer = "";


                // crea la nuova room
                $new_room = create_room( $room_psw , $offer, $room_desc );

                // genera la nuova lista con la nuova room
                add_new_room_to_rooms_list( $new_room );

                // ritorna in output la nuova lista
                echo json_encode( get_rooms_list_without_passwords() );
                // echo get_rooms_list_without_passwords();
                // print_r( get_rooms_list_without_passwords() );
                // print_r( get_rooms_list_without_passwords()."<br><br>" );

                

            } else {
                // Errore
                // echo json_encode({"result": "fail" });
                echo json_encode ( '{ "error" : "the offer parameter is missing" }' );
            }

            break;

        // serve ? 
        // concella la room se levata dal peerA o se è avvenuta un collegamento con il peerB
        case "delete_room":
            
            if( isset( $_GET["room_id"] ) && isset( $_GET["room_psw"] ) ){

                // inizializzazione variabili necessarie
                $room_id = $_GET["room_id"];
                $room_psw = $_GET["room_psw"];  


                // creazione della nuova lista senza la room designata ---
                $new_rooms_list = '[';
                $json_rooms_list = json_decode( load_rooms_list_from_file() , true );

                $add_comma = false;

                foreach( $json_rooms_list as $room ){

                    if( $room["room_id"] == $room_id && $room["room_psw"] == $room_psw ) {

                        continue;

                    } else {

                        // se è il primo elemento non aggiunge la virgola
                        if( $add_comma ) $new_rooms_list .= ',';
                        else $add_comma = true;
                        
                        $new_rooms_list .= json_encode( $room );
                    } 
                }
                
                $new_rooms_list .= ']';

                // -------------------------------------------------------

                save_rooms_list_in_file( $new_rooms_list );

                // ritorna in output la nuova lista
                echo json_encode(  get_rooms_list_without_passwords() );
                
            } else {
                // Errore
                echo json_encode ( '{ "error" : "wrong parameters" }' );
            }

            break;

        // un peer richiede la lista delle SDP Offers disponibili
        case "get_rooms_list":

            $jo = json_encode( get_rooms_list_without_passwords()  );
            echo $jo;

            break;

        // il peerB invia l' SDP Answer ricavata dalla SDP Offer del peerA
        case "join_room":

            if( isset( $_GET["room_id"] ) && isset( $_GET["room_psw"] ) 
                && ( isset( $_GET["answer"] ) || isset( $_POST["answer"] )  ) ){

                // inizializzazione variabili necessarie ---
                $room_id = $_GET["room_id"];
                $room_psw = $_GET["room_psw"];  
                if( isset( $_GET["answer"] ) ) $answer = $_GET["answer"];
                if( isset( $_POST["answer"] ) ) $answer = $_POST["answer"];
                // -----------------------------------------

                $room = get_room_from_id ( $room_id );
                // print_r( $room  );
                
                if(  $room["room_psw"] == $room_psw ) {
                        

                    // prevede vari modi per indicare che la room non ha ancora una sdp answer
                    if( $room["sdp_answer"] == "null" || $room["sdp_answer"] == "NULL" 
                        || $room["sdp_answer"] == "" || $room["sdp_answer"] == "none" ) {

                        update_sdp_answer( $room_id, $room_psw, $answer );

                        // restituisce la lista delle rooms
                        // echo json_encode( get_rooms_list_without_passwords()  );

                        // restituisce l'esito della richiesta 
                        echo json_encode ( '{"status":"answer_updated"}' );

                    } else {
                        // Errore : room ha già una sdp answer
                        
                        // restituisce l'esito della richiesta 
                        echo json_encode ( '{"status":"answer_NOT_updated"}' );
                    }
                }
                

            } else {
                // Errore
                echo json_encode ( '{ "error" : "wrong parameters" }' );
            }

            break;

        // il peerA controlla se vi è stata associata una SDP Answer alla SDP Offer inviata
        // se è così, il server gliela invia e il peerA può effettuare la connessione Peer To Peer
        case "check_answer":

            if( isset( $_GET["room_id"] ) && isset( $_GET["room_psw"] ) ){

                // inizializzazione variabili necessarie ---
                $room_id = $_GET["room_id"];
                $room_psw = $_GET["room_psw"];  
                // -----------------------------------------

                $room = get_room_from_id( $room_id );

                if( $room["room_psw"] == $room_psw ){

                    // prevede vari modi per indicare che la room non ha ancora una sdp answer
                    if( $room["sdp_answer"] == "null" || $room["sdp_answer"] == "NULL" 
                    || $room["sdp_answer"] == "" || $room["sdp_answer"] == "none" ) {
                        // print_r("null");
                        
                        // restituisce l'esito della richiesta 
                        echo json_encode ( '{ "room_answer" : "NULL" }' );
                        
                        // print_r("NULL");
                    } else {
                        
                        // restituisce l'esito della richiesta 
                        echo json_encode ( '{ "room_answer":'.json_encode($room["sdp_answer"]).' }' );

                        // print_r( $room["sdp_answer"] );
                    }
                } else {

                    // password errata
                    echo json_encode ( '{ "room_answer" : "wrong_psw" }' );
                }


            } else {
                // Errore
                echo json_encode ( '{ "error" : "wrong parameters" }' );
            }

            break;

            default:
                echo json_encode ( '{ "error" : "command not found" }' );


    }