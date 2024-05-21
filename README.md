# Useful node scripts

Within this repo are a number of scripts that can be used to support day to day working activities.

# add-cpr-to-tracking

Run via the command line with the command `node add-cpr-to-tracking.js`.

Script will look for files within the folder `/input` with naming convention `cpr-*.js`, where `*` is a number. Files should be a cut of the `completedPaymentRequests` database.

Script will use the contents of this file to build data to be loaded into the tracking database.

Performs some calculations on the data contained within the file to calculate a few of the fields, while others are direct copies of the database data.

Output will be added to the `/output` folder.

The script is to be ran to add all such data to a temporary database, and then used in conjunction with `load-temp-values-cpr.sql`. The latter will check for any such data already existing in the target database, checking against `correlationId` and `frn`, and load anything identified as absent.

# add-pr-to-tracking

Run via the command line with the command `node add-pr-to-tracking.js`.

Script will look for files within the folder `/input` with naming convention `pr-*.js`, where `*` is a number. Files should be a cut of the `paymentRequests` database.

Script will use the contents of this file to build data to be loaded into the tracking database.

Performs some calculations on the data contained within the file to calculate a few of the fields, while others are direct copies of the database data.

Output will be added to the `/output` folder.

The script is to be ran to add all such data to a temporary database, and then used in conjunction with `load-temp-values-pr.sql`. The latter will check for any such data already existing in the target database, checking against `correlationId` and `frn`, and load anything identified as absent. It will also update values for anything where a match is identified, as some values for instance the `value` cannot be identified from the `add-cpr-to-tracking` script.

# amend-manual-file

Pending

# build-customer-updates

Pending

# build-remove-suppressions-script

Pending
