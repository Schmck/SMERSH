import { ClientBuilder } from './ClientBuilder'

console.log('Hello world');

console.log(ClientBuilder.getIndices());
//ClientBuilder.BuildClient("http://localhost:9209")

new ClientBuilder().getMappings();
//ClientBuilder.getMappings();
console.log('goodbye world')