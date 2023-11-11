# SMERSH


HOW TO SET UP

clone the repo (duh)

download and install the latest version of node (link below)
https://nodejs.org/en/download

download and install the following version of elastic
https://www.elastic.co/downloads/past-releases/elasticsearch-7-16-1

i would recommend making an elastic folder on C:\

you can run elastic manually but i would recommend installing it as a service.

to do so navigate to .\bin inside elastic and run

.\elasticsearch-service.bat install NAME_HERE

  
navigate to the root directory
run `npm install`

run `\npminstallall.ps1` (sorry linux users!)

run `\build.ps1`

navigate to .\Web

before you can start the bot you will need to do a few things:
  1. create a steam account for the bot
  2. create an account with openai for a chatgpt token (https://platform.openai.com/account/api-keys)
  3. generate a steam api token (https://steamcommunity.com/dev/apikey)
  4. get authcred token for the webadmin  
    a. login to the webadmin in a browser  
    b. open devtools (typically f12)  
    c. navigate to the application tab  
    d. find the cookies  
    e. copy the authcred value  
5. create a discord bot and copy the token (https://discord.com/developers/applications)
6. create a command channel to use the bot in and copy the id.
7. create a log channel and copy the id.
8. create a chatlog channel and copy the id.
9. create a dashboard channel and copy the id.

to start the bot you will need to supply it with arguments, if you followed the previous steps you should have everything you need.

{\"GAME\":\"RO2\",\"BASE_URL\":\"WEBADMIN_URL:8080/ServerAdmin\",\"ELASTIC_URL\":\"http://localhost:9200/\",\"AUTHCRED\":\"AUTHCRED\",\"DISCORD_TOKEN\":\"TOKEN\",\"LOG_CHANNEL_ID\":\"LOG_CHANNEL_ID\",\"CHATLOG_CHANNEL_ID\":\"CHATLOG_CHANNEL_ID\",\"DASHBOARD_CHANNEL_ID\":\"DASHBOARD_CHANNEL_ID\",\"SCOREBOARD_ID\":\"EMPTY\",\"CHATLOG_ID\":\"EMPTY\",\"STEAM_TOKEN\":\"STEAM_TOKEN\",\"STEAM_ACCOUNT_NAME\":\"STEAM_ACCOUNT_NAME\",\"STEAM_ACCOUNT_PASSWORD\":\"STEAM_ACCOUNT_PASSWORD\",\"CHATGPT_API_KEY\":\"CHAT_GPT_API_KEY\",\"COMMAND_CHANNEL_ID\":\"COMMAND_CHANNEL_ID\",\"PORT\":CAN_BE_ANY_NUMBER}

both SCOREBOARD_ID and CHATLOG_ID should be empty on the first run, after the first run copy the id of the scoreboard and chatlog in the chatlog channel.

GAME can be set to either RO2 or RS1

its very important you maintain the suffix for the webadmin url otherwise it will not work

above all else do not mess with the slashes and quotes otherwise the bot wont be able to parse it.

now that you have everything you need you can go ahead and start the bot

node server.js 'ARGS'

replace args with the arguments above but keep the singlequotes.

IT WORKS!

