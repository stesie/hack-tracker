
test: *.result
	tmpfile=`mktemp`; \
	ls -1 *.result | while read fn; do \
		../../bin/shot-scraper "$${fn%.result}" > $$tmpfile || truncate -s 0 $$tmpfile; diff -u $$tmpfile "$$fn"; \
	done; rm -f "$$tmpfile"

.PHONY: test
