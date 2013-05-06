
test: *.result
	for fn in $^; do \
		../../bin/shot-scraper $${fn%.result} | diff -u - $$fn; \
	done

.PHONY: test
