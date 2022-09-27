#!/usr/bin/env node

`use strict` ;

const colors = require ( `colors` ) ;

const express = require ( `express` ) ;

const http = require ( `http` ) ;

const moment = require ( `moment` ) ;

const path = require ( `path` ) ;

const socket_io = require ( `socket.io` ) ;

const formatter = ( ( user , text ) =>
	{
		return ( { user , text , time : moment () . format ( `h:mm:ss a` ) } ) ;
	}
) ;

const users = [] ;

const join_users = ( ( id , username , room ) =>
	{
		const user = { id , username , room } ;
		users . push ( user ) ;
		return ( user ) ;
	}
) ;

const current_users = ( ( id ) =>
	{
		return ( users . find ( user => user . id === id ) ) ;
	}
) ;

const leave_users = ( ( id ) =>
	{
		const index = users . findIndex ( user => user . id === id ) ;
		if ( index !== -1 )
		{
			return ( users . splice ( index , 1 ) [ 0 ] ) ;
		}
		return ;
	}
) ;

const room_users = ( ( room ) =>
	{
		return ( users . filter ( user => user . room === room ) ) ;
	}
) ;

const app = express () ;

const server = http . createServer ( app ) ;

const io = socket_io ( server ) ;

app . use ( express . static ( path . join ( __dirname , `frontend` ) ) ) ;

const bot_name = `room-chatter` ;

io . on ( `connection` , ( socket ) =>
	{
		socket . on ( `join` , ( { username , room } ) =>
			{
				const user = join_users ( socket . id , username , room ) ;
				socket . join ( user . room ) ;
				socket . emit ( `message` , formatter ( bot_name , `Welcome to Room-Chatter.` ) ) ;
				socket . broadcast . to ( user . room ) . emit ( `message` , formatter ( bot_name , `${ user . username } has joined the chat.` ) ) ;
				io . to ( user . room ) . emit ( `room_users` , { room : user . room , users : room_users ( user . room ) } ) ;
				return ;
			}
		) ;
		socket . on ( `message` , ( message ) =>
			{
				const user = current_users ( socket . id ) ;
				io . to ( user . room ) . emit ( `message` , formatter ( user . username , message ) ) ;
				return ;
			}
		) ;
		socket . on ( `disconnect` , () =>
			{
				const user = leave_users ( socket . id ) ;
				if ( user )
				{
					io . to ( user . room ) . emit ( `message` , formatter ( bot_name , `${ user . username } has left the chat.` ) ) ;
					io . to ( user . room ) . emit ( `room_users` , { room : user . room , users : room_users ( user . room ) } ) ;
				}
				return ;
			}
		) ;
	}
) ;

const port = process . env . PORT || 5000 ;

server . listen ( port , () =>
	{
		console . log ( `room-chatter listening on port: ` . brightWhite , `${ port }` . brightGreen ) ;
		return ;
	}
) ;
