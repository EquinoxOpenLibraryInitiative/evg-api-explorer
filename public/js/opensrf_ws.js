/* -----------------------------------------------------------------------
 * Copyright (C) 2014  Equinox Software, Inc.
 * Bill Erickson <berick@esilibrary.com>
 *  
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * ----------------------------------------------------------------------- */


var WEBSOCKET_URL_PATH = '/osrf-websocket-translator';
var WEBSOCKET_PORT_SSL = 443;

OpenSRF.WebSocket = function() {
    this.pending_messages = [];
}

OpenSRF.WebSocket.prototype.connected = function() {
    return (
        this.socket && 
        this.socket.readyState == this.socket.OPEN
    );
}

/**
 * If our global socket is already open, use it.  Otherwise, queue the 
 * message for delivery after the socket is open.
 */
OpenSRF.WebSocket.prototype.send = function(message) {
    var self = this;

    if (this.connected()) {
        // this.socket connection is viable.  send our message now.
        this.socket.send(message);
        return;
    }

    // no viable connection. queue our outbound messages for future delivery.
    this.pending_messages.push(message);
    console.log('pending count ' + this.pending_messages.length);

    if (this.socket && this.socket.readyState == this.socket.CONNECTING) {
        // we are already in the middle of a setup call.  
        // our queued message will be delivered after setup completes.
        return;
    }

    // we have no websocket or an invalid websocket.  build a new one.

    var path = 'wss://' + location.host + ':' + 
        WEBSOCKET_PORT_SSL + WEBSOCKET_URL_PATH;

    console.debug('connecting websocket to ' + path);

    try {
        this.socket = new WebSocket(path);
    } catch(E) {
        console.log('Error creating WebSocket for path ' + path + ' : ' + E);
        throw new Error(E);
    }

    this.socket.onopen = function() {
        console.debug('websocket.onopen()');
        // deliver any queued messages
        var msg;
        console.log('pending count ' + self.pending_messages.length);
        while ( (msg = self.pending_messages.shift()) )
            self.socket.send(msg);
    }

    this.socket.onmessage = function(evt) {
        self.onmessage(evt.data);
    }

    /**
     * Websocket error handler.  This type of error indicates a probelem
     * with the connection.  I.e. it's not port-specific. 
     * Broadcast to all ports.
     */
    this.socket.onerror = function(evt) {
        var err = "WebSocket Error " + evt + ' : ' + evt.data;
        self.socket.close(); // connection is no good; reset.
        throw new Error(err); 
    }

    /**
     * Called when the websocket connection is closed.
     *
     * Once a websocket is closed, it will be re-opened the next time
     * a message delivery attempt is made.  Clean up and prepare to reconnect.
     */
    this.socket.onclose = function() {
        console.debug('closing websocket');
        self.socket = null;
        if (OpenSRF.onWebSocketClosed)
            OpenSRF.onWebSocketClosed();
    }
}
