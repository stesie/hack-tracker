What is it?
---------------

Hack Tracker is a project to collect hack results (i.e. item drops) of the Niantic's ARG Ingress
to interpret them, for statistics and fun.

This is done by collecting screenshots of the portal info page and the hack results page.  After
your trip, copy over the screenshots from your phone and run them through hack-tracker, which
uses OCR (using tesseract engine) to recognize them and create a JSON representation of the results,
including

* level of each resonator
* kind of hack (friendly/enemy)
* results (i.e. which items were dropped and how many of them)
* whether it was a multi hack
* hacker's nick and level (must be provided to hack tracker of course)


How to install?
-------------------

This is just a rough walk through installation on Debian based GNU/Linux systems:

First of all you need to install the dependencies of hack-tracker shell scripts:
tesseract, imagemagick, make, curl, php5 (incl. gd module)

```
apt-get install tesseract-ocr tesseract-ocr-eng imagemagick make curl php5-cli php5-gd
```

Secondly you need to run tesseract training on provided hack result images:
(`make install` installs the files to `/usr/share/tesseract-ocr/tessdata/`)

```
cd tessdata/training.res
make res.traineddata
sudo make install
```

Thirdly copy extra tesseract configs from `tessdata/configs` to
`/usr/share/tesseract-ocr/tessdata/configs/` directory.

hack-tracker scripts should now be ready to use.

Just run some tests to make sure:

```
cd test/acquired-items
make test
```


How to use?
---------------

Go to the directory where you've copied the screenshots to, then:

```
/path/to/hack-tracker/bin/shot-looper stesie 8 *.png > data.json
```

... and of course replace the nickname and level specification.

This processes all the provided screenshots and writes detected
information to data.json file.

In order to inject it to a couch database, use curl like this
(assumes that you've already created a database named hack-tracker):

```
curl -H 'Content-type: application/json' -X POST -v 'http://localhost:5984/hack-tracker/_bulk_docs' -T data.json
```


How to use pHash support (experimental)
-----------------------------

First you need to install pHash and its PHP module

```
sudo apt-get install cimg-dev libsndfile1-dev libsamplerate0-dev libmpg123-dev php5-dev
wget http://phash.org/releases/pHash-0.9.6.tar.gz
tar xvzf pHash-0.9.6.tar.gz
cd pHash-0.9.6/
./configure --enable-video-hash=no LIBS="-lpthread"
make
sudo make install
cd bindings/php
./configure LIBS="-lpthread"
make clean
make
sudo make install
echo extension="pHash.so" | sudo tee /etc/php5/conf.d/20-phash.ini
```

