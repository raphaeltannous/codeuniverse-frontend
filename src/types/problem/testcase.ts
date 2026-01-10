export interface TestCase {
  id: number;
  input: any;
  expected: any;
  isPublic: boolean;
}

export interface FailedTestcase extends TestCase {
  got: any;
}
