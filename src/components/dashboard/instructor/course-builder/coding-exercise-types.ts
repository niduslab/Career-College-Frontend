import type {
  CodingLanguageConfig,
  CodingTestCase,
} from "@/lib/course-api";

/** UI-level language config: the real config row plus local save/delete state. */
export interface UiLanguageConfig extends CodingLanguageConfig {
  saving: boolean;
}

/** UI-level test case: the real test case row plus local save/delete state. */
export interface UiTestCase extends CodingTestCase {
  saving: boolean;
}
