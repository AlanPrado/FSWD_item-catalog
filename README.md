# Project: Item Catalog

Build a web application that manage categories and categories items.

## Quick start

- Download and install [Virtual Box](https://www.virtualbox.org/wiki/Downloads)
- Download and install [Vagrant](https://www.vagrantup.com/downloads.html)
- Clone the repo: `https://github.com/AlanPrado/item-catalog/`
- Run: `vagrant up` to setup vagrant
- Run: `vagrant ssh` to enter into VM

### Create Google Credentials

The [server-side-flow](https://developers.google.com/identity/sign-in/web/server-side-flow) oauth flow was implemented.

For that is necessary to 
- Create a google project
- Create a OAuth google credential 
- And replace the content of the [client_secret.json](https://github.com/AlanPrado/item-catalog/blob/master/catalog/server/client_secret.json) file for your credentials.

Finally run: `python /vagrant/catalog/server.py` to launch.
The project should be running at http://localhost:5000/.

### What's included

The project runs over a vagrant virtual machine.

The vagrant machine came with the following technologies:

+ sqllite: store user, category and category items information
+ redis: store user session data
+ python libraries: flask, sqlalchemy and googleclientapi
+ angularjs and bootstrap: front end data presentation

## Copyright and license
Code and documentation copyright 2017-2017 Code released under the [MIT License](https://github.com/AlanPrado/item-catalog/blob/master/LICENSE)

## Authors

#### Original Author and Development Lead

- Alan Thiago do Prado (aprado.cnsp@gmail.com)
