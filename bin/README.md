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
tesseract, imagemagick, make, curl

<pre>
apt-get install tesseract-ocr tesseract-ocr-eng imagemagick make curl
</pre>

Secondly you need to run tesseract training on provided hack result images:
(`make install` installs the files to `/usr/share/tesseract-ocr/tessdata/`)

<pre>
cd tessdata/training.res
make res.traineddata
sudo make install
</pre>

Thirdly copy extra tesseract configs from `tessdata/configs` to
`/usr/share/tesseract-ocr/tessdata/configs/` directory.

hack-tracker scripts should now be ready to use.

Just run some tests to make sure:

<pre>
cd test/acquired-items
make test
</pre>


How to use?
---------------

Go to the directory where you've copied the screenshots to, then:

<pre>
/path/to/hack-tracker/bin/shot-looper stesie 8 *.png > data.json
</pre>

... and of course replace the nickname and level specification.

This processes all the provided screenshots and writes detected
information to data.json file.

In order to inject it to a couch database, use curl like this
(assumes that you've already created a database named hack-tracker):

curl -H 'Content-type: application/json' -X POST -v 'http://localhost:5984/hack-tracker/_bulk_docs' -T data.json

