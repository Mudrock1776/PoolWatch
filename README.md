# PoolWatch #
Group 4 Senior Design Project Repository

### Drivers ###
See /webserverDrivers for the arduino drivers for connecting to the webserver

#### Developing ####
I reccomend creating a driver for your section and putting it in the webserverDrivers folder. Follow my exmple for a guide on how to do it.

### Webserver ###
Requirements:
- Node >=20.10.0
- npm >=10.9.2
- mongoDB >=6
Reccomendations:
- Podman/Docker

#### Running the Webserver ####
The source code for the webserver is found in the /src folder and all the following command are run in that folder.

To start the server, you must first build the server, which can be done with this command:
```
npm run build
```

After building the server run following command to start it:
```
npm start
```

The server will now be running on port 8080, and can be accessed on a broweser with the link http://localhost:8080. The device will need the computer you ran this on's IP and the port 8080 to access the server. You can find your IP using the following command in a terminal on windows:
```
ipconfig
```

Your Ip will be the IPv4 Address.

To stop the webserver use the keyboard interupt Ctrl+C. you can clean the server by using the command:
```
npm run clean
```

Please note that you will need a MongoDB server running for the webiste to work. There are several options to do this, but I reccomend using podman or docker to start up an instance with the following command:
```
podman run -p 27017:27017 mongo:6
```

It is the same command id Docker just replace podman with Docker (Podman is linux only btw).

You can stop the database by using the keyboard interupt Ctrl+C. This will leave some extra junk, which can be removed using the following commands:
```
podman stop -a
podman rm -a
```

Please note that this will erase everything in the database so you will need to recreate an account and resources. Also note that there will be a lingering token for your account in your webrowser so look to delete the localstorage, which you can find guides on how to do on google. YOU MUST DO THAT as the site CURRENTLY will BREAK if an unregonized token is found.

Known Bugs:
- reports/devices not loading properly: just refresh multiple times
- site broken after dumping database: delete your local storage
- added device that doesn't exist: don't do that

#### Testing ####
Some simple messages are provided for testing in /test. Run the script deviceMimic.py to test messages comming from the device.

#### Developing ####


### System administration and DevOps ###
Requirements:
- Access to an RKE2 cluster (would be on a linux machine)
- Podman
- Helm

Just message Dylan Hughes to do this, unless you really want to, in which case still message him for the sysadmin keys.

#### Building Images ####
To build an image, update the version in the version file and change the repos in buildimage.sh to the repos you want and then run the script. turn off tls verification for a repo that is unsecure.

#### building a dev environemet ####
Use the helm chart in /devInfastructure and update the values to suite you also add a folder /mnt/registry.

#### Deploying the webserver ####
use the helm chart in /PoolWatch, and update the values to reflect your needs.

##### TODO #####
- Add the notification system
- Add deletion capabilities
- Format website to look presentable
- fix the token error
- limit device adding capabilities to existing devices
- add search capabilities
- make reports appear without refreshing the page.
- check time since last status to see device connectivity
- maybe one day make this phone compatiable
- maybe one day care about security

##### Contributers (Write code if you want to be in this) #####
- Dylan Hughes
