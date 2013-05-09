
test: *.result
	ls -1 *.result | while read fn; do \
		../../bin/shot-scraper "$${fn%.result}" | diff -u - "$$fn"; \
	done

.PHONY: test
