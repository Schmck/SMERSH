import { ClientBuilder } from './ClientBuilder'

console.log('Hello world');

console.log(ClientBuilder.getIndices());
ClientBuilder.BuildClient("http://localhost:9209")
//ClientBuilder.getMappings();
console.log('goodbye world')