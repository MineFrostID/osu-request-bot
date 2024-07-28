# Youtube-np-Bot

## Preparation
Here's a list of all software that needs to be installed before you download the bot.
1. Software to install:
   1. [Streamer.bot](https://streamer.bot/)
   2. [node.js](https://nodejs.org/en/download/prebuilt-installer)
   
2. Installation (Skip this part if you know how to install it)
   1. Streamer.bot
      1. Donwload Streamer.bot [here](https://streamer.bot/)
      2. Open the software, go to:
         > Platform>Youtube>Account
         
         And login your own Youtube Account on "Broadcaster Accout" (Or if you have your own bot account, login on the "Bot Account)
      3. After you login, go to Import and put this text:
         ```
         U0JBRR+LCAAAAAAABADtWFlv4zYQfi/Q/yAbCNACYULqVt7S9MoC2xbZtkDRXRQ8RrawupaiciDIfy+pwxflhdd7FN3WgGWL3/CYmW+GQz5++YXjzG9BNllVzi8c77RryIq6kur33eYiK7OiLdbtc3zmnnnzAQVFddujedGvJS3AiFRNO7uBNy00yvmjalXLwPmmUn0nLUdbtaykkXyelfC9rBp1/e0KXS9tTs7wGV4BAhous1oN4OZw1U1bXvIBKds8N9BTv0hBtxZJO7FGt/zZtzgj1MGZMGNzHiQBizhirusi38MuSgIskM9CHkEcRT6Bcf6um1a2hWHuzXYoKcvBjKlkC1vIPc9bYbQvfswaVckHLZTSvNmSGk36nGalM2i4iS9k1db7bH61pIqt7d6rn9/Rh0aba2o2SUtRFStDWjivSt5KCaWaQpXMFgvtvE3T7ph3GKUo9ETXnaUpYWkSxAJBSDHyBQ4Q5T5HXhhGQGmMcRhuKrDhJBEFzI2jEEUYtGsi6qKYCI6069KIuACEEqureqiNQX1MdpG9rlq7qxmZ82oTfVq/vNoytc20KXO0MjfaLJWqL87P84rTfKkj4sLDGJ/L3qXnJ5LeXZd1q07OT9oG5Iml2C2VmVHgp4ExHe13hZZARe+hx6ddrKaygcvmWTPp+027U0oS8FwErq+DI6UUxSH2kJdQ8EmCdbTYM99Btlga2uiI3uMTgnG0C4383omrAxyWlQLuzahbrjp9myd2TTja3FKmqkHSIUgsbW5p3qWCudWtJ0TP+4D4goWYoAiYr8mLfcQojrQRvTjCxE8TYfNetuV1UYDIqIL8YY/iNFUgVzFs01z79XJjIXj4oInH+LEWYga5OWQx3WxbC7LsZdL3rz0D3kI6TF0fSIoRCXCKfJdgxCAOESaJxxJKUxGxo0jnWsgqp9pqH8Q4fDzjJoN2k23JcWxjQlss8DzEokBnWQg9RGOWoCQijEaEcpakn4RtbsACAm6KmOa4TvdcIOrrLAJx6vtR7EIaJx+SbdaCDmNbkhLmGVNFrq/t5ev9JaGBiyLBgzjlLnCPf2C2HZ/h3MM3ox/MZP0Otr2v5zmtGxAb+AivCWyXSe+axD56mXTVlxa68gH++l9RKB1TMSi4N+POf8mBNuDoesBRy6xxhsLqwpkNZYPzFQOqClr/lYmvnZfyZak1djgtuz4zedpJnq7kTx050194o5+VdIbWmcX0WkIKWj1xyXnVdkpavO4ZAi5m4PEYYc8LdNqOdNomoUChl3AQKQH9ckwg+dgu4N4/kvA/FknvmqA/eiTp85rzc5rm+oD22ceRUcUZddHrd3QsTeje9Tmc+roQFikFjlKGQW91rNv0QsQM7Wkcc8L+p/4RJcGnoX75n2B+f5Y8dU5M4WmfKQ8nu2+yfAS6QnKZzl/Y5K9An+VjESdhlBIcBPYp4nMle/9nlO/5ujXEeAWy9xaqqVrJwXIj2bNUfUAoMqVA/NZMkWIF71EmO+omZuu6b0yf8+mAtAiclV1ETsRqUXXNeNvanbnMZDNpyhhTsIy/ZlrzX866py5ehl+rdplLWMD9d/d1nvFMXdFatXLqIDA3lzATx9V5tigrCTo/rONhd/m9yHWpDyElzScEanO92agr0x/kdOiPEJ7oaFz8ls7tGraueeZcl4svoGwyld1OKr7IK0bzq6rKRXVn1HftsVdY8F7ZcaEzoBpOYnhf6NwBayr+GtQLkLc71F6DV3mm8+Q2qLJilDcteuCnvwEW2DP4+hYAAA==
         ```
         And click "Import"
      4. Check on this section:
         > Commands

         Right click "osu!Request" and Enabled
      5. You're good to go to the next step
   2. nodejs
      1. Download nodejs [here](https://nodejs.org/en/download/prebuilt-installer)
      2. Install it
      3. Check on terminal using this command:
         ```
         npm -v
         ```
         If it's installed, it will give you the current version installed on your PC.
      4. You're good to go to the next step

## Installation
1. Download source code from [Release](https://github.com/MineFrostID/osu-request-youtube-bot/releases/)
2. Extract your .zip file and open the folder (doesn't have to be on the same folder as streamer.bot, you can extract this anywhere you want)
4. Change your osu! credential at
   ```
   .\config\account.json
   ```
   >username = Your osu! username
   
   > password = Your osu! password
   
   > token = Your [Legacy API server passowrd](https://osu.ppy.sh/home/account/edit#legacy-api)
3. Open terminal inside the folder and run this command:
   ```
   npm install
   ```
## How to use
1. Open Streamer.bot sofware
2. Open your bot folder and run this file:
   ```Start.bat```
3. Make a new stream schedule and GO LIVE
   > Note: this bot will not working if you don't have any live stream 

## Tutorial Video
STILL WIP (Don't have time to make it right now)

## Dependencies
* [osu-api-extended](https://github.com/cyperdark/osu-api-extended): by [cyperdark](https://github.com/cyperdark)
* [bancho.js](https://github.com/ThePooN/bancho.js): by [ThePooN](https://github.com/ThePooN)
