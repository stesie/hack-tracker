
test: *.result
	tmpfile=`mktemp`; \
	for fn in $^; do \
		../../bin/shot-scraper $${fn%.result} > $$tmpfile || truncate -s 0 $$tmpfile; diff -u $$tmpfile $$fn; \
	done; rm -f "$$tmpfile"

.PHONY: test
