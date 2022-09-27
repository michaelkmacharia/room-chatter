#!/usr/bin/env node

`use strict` ;

const chat_form = document . querySelector ( `#chat-form` ) ;

const chat_messages = document . querySelector ( `.chat-messages` ) ;

const leave_button = document . querySelector ( `#leave-btn` ) ;

const room_name = document . querySelector ( `#room-name` ) ;

const current_users = document . querySelector ( `#users` ) ;

const { username , room } = Qs . parse ( location . search , { ignoreQueryPrefix : true } ) ;

const output_message = ( ( message ) =>
	{
		const div = document . createElement ( `div` ) ;
		div . classList . add ( `message` ) ;
		const p = document . createElement ( `p` ) ;
		p . classList . add ( `meta` ) ;
		p . innerText = message . username ;
		p . innerHTML += `<span>${ message . time }</span>` ;
		div . appendChild ( p ) ;
		const para = document . createElement ( `p` ) ;
		para . classList . add ( `text` ) ;
		para . innerText = message . text ;
		div . appendChild ( para ) ;
		document . querySelector ( `.chat-messages` ) . appendChild ( div ) ;
		return ;
	}
) ;

const output_room = ( ( room ) =>
	{
		room_name . innerText = room ;
		return ;
	}
) ;

const output_users = ( ( users ) =>
	{
		current_users . innerHTML = `` ;
		users . forEach ( ( user ) =>
			{
				const li = document . createElement ( `li` ) ;
				li . innerText = user . username ;
				current_users . appendChild ( li ) ;
				return ;
			}
		) ;
		return ;
	}
) ;

const socket = io () ;

socket . emit ( `join` , { username , room } ) ;

socket . on ( `message` , ( message ) =>
	{
		console . log ( message ) ;
		output_message ( message ) ;
		chat_messages . scrollTop = chat_messages . scrollHeight ;
		return ;
	}
) ;

socket . on ( `room_users`, ( { room , users } ) =>
	{
		output_room ( room ) ;
		output_users ( users ) ;
		return ;
	}
) ;

chat_form . addEventListener ( `submit` , ( event ) =>
	{
		event . preventDefault () ;
		let message = event . target . elements . msg . value ;
		message = message . trim () ;
		if ( ! message )
		{
			return ( false ) ;
		}
		socket . emit ( `message` , message ) ;
		event . target . elements . msg . value = `` ;
		event . target . elements . msg . focus () ;
		return ;
	}
) ;

leave_button .addEventListener ( `click` , () =>
	{
		const leave = confirm ( `Are you sure you want to leave the room?` ) ;
		if ( leave )
		{
			window . location = `./index.html` ;
		}
		return ;
	}
) ;
