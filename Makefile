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

build-rp: # build rollup
	cd rollup && npm run build

start-rp: # start rollup
	cd rollup && npm run start

sm-build-rp: sm-log # spead measure rollup build
	cd rollup && eval 'npm run sm -- --repeat=$$SM_REPEAT'

build-pl: # build parcel
	cd parcel && npm run build

start-pl: # start parcel
	cd parcel && npm run start

sm-build-pl: sm-log # spead measure parcel build
	cd parcel && eval 'npm run sm -- --repeat=$$SM_REPEAT'
