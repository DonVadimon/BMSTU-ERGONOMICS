SM_REPEAT = 10
export SM_REPEAT

all:
	@echo "Choose task"
	exit 1

sm-log:
	echo "SM_REPEAT - $$SM_REPEAT"

build-wp: # build webpack
	cd webpack && npm run build

start-wp: # start webpack
	cd webpack && npm run start

sm-build-wp: sm-log # spead measure webpack build
	cd webpack && eval 'npm run sm -- --repeat=$$SM_REPEAT'

sm-watch-wp: sm-log # spead measure webpack watch
	cd webpack && eval 'npm run sm -- --repeat=$$SM_REPEAT --watch'

build-rp: # build rollup
	cd rollup && npm run build

start-rp: # start rollup
	cd rollup && npm run start

sm-build-rp: sm-log # spead measure rollup build
	cd rollup && eval 'npm run sm -- --repeat=$$SM_REPEAT'

sm-watch-rp: sm-log # spead measure rollup watch
	cd rollup && eval 'npm run sm -- --repeat=$$SM_REPEAT --watch'

build-pl: # build parcel
	cd parcel && npm run build

start-pl: # start parcel
	cd parcel && npm run start

sm-build-pl: sm-log # spead measure parcel build
	cd parcel && eval 'npm run sm -- --repeat=$$SM_REPEAT'

sm-watch-pl: sm-log # spead measure parcel watch
	cd parcel && eval 'npm run sm -- --repeat=$$SM_REPEAT --watch'

sm-build-all: sm-build-wp sm-build-rp sm-build-pl
	echo "🛠 build done"

sm-watch-all: sm-watch-wp sm-watch-rp sm-watch-pl
	echo "👀 watch done"

sm-all: sm-build-all sm-watch-all
	echo "🚀 done"

clear-out:
	rm -rf ./*/.build
	rm -rf ./*/.logs
