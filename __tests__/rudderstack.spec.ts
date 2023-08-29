import * as RudderAnalytics from "rudder-sdk-js";
import { RudderStack } from "../src/rudderstack";

jest.mock("rudder-sdk-js", () => {
  const original_module = jest.requireActual("rudder-sdk-js");
  return {
    ...original_module,
    load: jest.fn(),
    ready: (callback: () => any) => callback(),
    track: jest.fn(),
  };
});

describe("rudderstack", () => {
  let rudderstack: RudderStack;
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      CIRCLE_JOB: "release_staging",
      RUDDERSTACK_PRODUCTION_KEY: "123456789",
      RUDDERSTACK_STAGING_KEY: "123456789",
      RUDDERSTACK_URL: "http://example.com",
    };
  });

  beforeEach(() => {
    rudderstack = new RudderStack();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("should be initialized when instance is created", () => {
    expect(rudderstack.has_initialized).toBe(true);
  });

  test("should be identified once identify event is called", () => {
    rudderstack.identifyEvent("C123", {
      language: "en",
    });

    expect(rudderstack.has_identified).toBe(true);
  });

  test("should not be empty if current page is passed", () => {
    rudderstack.identifyEvent("C123", {
      language: "en",
    });

    rudderstack.pageView("app.deriv.com");

    expect(rudderstack.current_page).not.toBe("");
  });

  test("should be called once when track is invoked", () => {
    const spy = jest.spyOn(rudderstack, "track");
    rudderstack.track("ce_trade_types_form", {
      action: "open",
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("should not be identified when reset is called", () => {
    rudderstack.reset();

    expect(rudderstack.has_identified).toBe(false);
  });

  test("should call RudderAnalytics track function if is_anonymous pass to true", () => {
    const analyticsSpy = jest.spyOn(RudderAnalytics, "track");

    rudderstack.track(
      "ce_trade_types_form",
      {
        action: "open",
      },
      { is_anonymous: true }
    );

    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    expect(analyticsSpy).toHaveBeenCalledWith("ce_trade_types_form", {
      action: "open",
    });
  });

  test("should not call RudderAnalytics track function if not identified and is not anonymous", () => {
    const analyticsSpy = jest.spyOn(RudderAnalytics, "track");

    rudderstack.track(
      "ce_trade_types_form",
      {
        action: "open",
      },
      { is_anonymous: false }
    );

    expect(analyticsSpy).not.toHaveBeenCalled();
  });
});
