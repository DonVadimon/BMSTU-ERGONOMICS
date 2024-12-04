all:
	@echo "Choose task"
	exit 1

build-wp: # build webpack
	cd webpack && npm run build

start-wp: # start webpack
	cd webpack && npm run start

build-rp: # build rollup
	cd rollup && npm run build

start-rp: # start rollup
	cd rollup && npm run start

build-pl: # build parcel
	cd parcel && npm run build

start-pl: # start parcel
	cd parcel && npm run start
