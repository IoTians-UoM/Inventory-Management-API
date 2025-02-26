import { WebSocketServer } from "ws";
import { Message } from "../types/types";

let webSocketServer:WebSocketServer;
let webSocketServerClient:any;

export const initWSServer = (port:number, handleMessage:Function):WebSocket => {
    if(webSocketServer && webSocketServerClient){
        console.log('Returning existing WebSocket server');
        return webSocketServerClient;
    }

    webSocketServer = new WebSocketServer({ port }, () => {
        console.log('WebSocket server started on ws://localhost:' + port);
    });

    webSocketServer.on('connection', (ws) => {
        console.log('Client connected.');
        webSocketServerClient = ws;

        ws.on('message', (message:string) => {
            console.log(`Received: ${message}`);
            try {
                const msg = JSON.parse(message);
                handleMessage(msg);
            } catch (error) {
                console.error('Invalid message format:', error);
                // sendError(ws, 'Invalid JSON format');
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected.');
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    return webSocketServerClient;
}

export const sendWSMessage = (message:Message):void => {
    if(webSocketServerClient){
        webSocketServerClient.send(JSON.stringify(message));
    }
    else{
        console.error('WebSocket client not connected');
    }
}