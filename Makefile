vedabase-init:
	node index -action init

vedabase-chapters:
	node index --action=chapters --engine=vedabase --url=https://vedabase.io/en/library/sb/ --abbr=sb --lang=en --levels=3 # url, abbr, lang, levels

vedabase-content:
	node index --action=content --book_id=$1 --last-chapter= # book_id