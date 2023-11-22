vedabase-init:
	node index init vedabase

vedabase-chapters:
	node index chapters vedabase https://vedabase.io/en/library/sb/ sb en 3 # url, abbr, lang, levels

vedabase-content:
	node index content vedabase $1 # book_id