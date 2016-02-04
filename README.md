# w3c_validator
Developer extension for Chrom(e|ium). Validate documents. NOT the official W3C Validator, but using the official API.

https://chrome.google.com/webstore/detail/w3c-validator/bogcdgenpenfhebgnnlhhopahahamhik

This extension also needs a validation proxy because the official W3C service does not allow AJAX requests. A reference implementation of such a proxy is https://github.com/monojp/w3c_proxy which is currently hosted on http://validator.herndl.org

## changelog
###### Version 1.4
* Use SSL by default for proxy
