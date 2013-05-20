clean:
	rm -f unicharset
	rm -f *.tr
	rm -f *.txt
	rm -f font_properties
	rm -f res.freq-dawg
	rm -f res.inttemp
	rm -f res.normproto
	rm -f res.pffmtable
	rm -f res.shapetable
	rm -f res.traineddata
	rm -f res.unicharset

unicharset: *.box
	unicharset_extractor $^

font_properties:
	echo ingress 0 0 0 0 0 > $@

%.box: %.png
	tesseract $< $(patsubst %.png, %, $<) -l res batch.nochop makebox

%.tr: %.png
	tesseract $< $(patsubst %.png, %, $<) nobatch box.train

train: font_properties unicharset
	make $(patsubst %.png, %.tr, $(wildcard *.png))
	shapeclustering -F font_properties -U unicharset *.tr
	mftraining -F font_properties -U unicharset -O res.unicharset *.tr
	cntraining -F font_properties -U unicharset *.tr
	wordlist2dawg frequent_words_list res.freq-dawg res.unicharset 
	wordlist2dawg words_list res.word-dawg res.unicharset 

res.traineddata: train
	mv shapetable res.shapetable
	mv normproto res.normproto
	mv inttemp res.inttemp
	mv pffmtable res.pffmtable
	combine_tessdata res.

install: res.traineddata
	install -m644 $< /usr/share/tesseract-ocr/tessdata/
