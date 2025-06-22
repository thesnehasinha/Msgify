import { io } from 'socket.io-client';

const socket = io("https://msgify.onrender.com")

export default socket;
