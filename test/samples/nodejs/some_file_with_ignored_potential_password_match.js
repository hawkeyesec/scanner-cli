// hawkeye: ignore_content_match (can include some justification here, e.g. 'this variable is called password but the code does not contain the credential')
password = 'this is just a variable named password - not an actual credential';

// hawkeye: ignore_content_match
const test_password = 'this is just a variable named password - not an actual credential';

// Can put the ignore anywhere on the line previous to match hawkeye: ignore_content_match
const another_test_password = 'this is just a variable named password - not an actual credential';

class SomeClass {
  constructor() {
    this.an_actual_password = 'this one should be reported!';
  }
}
