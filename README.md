# Metronami-Loader-Core
This is a package in Metronami-Loader that allows the loader to update itself using NPM.

## Why does this exist?
Metronami-Loader cannot update itself since it somehow has to delete itself during runtime. To avoid that, this package exists in which Metronami-Loader will always attempt to fetch latest copies of this package before starting up. Since this core package contains all the code that Metronami-Loader will need to run, this package will never ever need to be updated since NPM already does it to the core upon boot.
