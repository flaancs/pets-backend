import { formatUserName } from "./privacy";

describe("formatUserName", () => {
  it("should abbreviate the last name for names with multiple parts", () => {
    expect(formatUserName("John Doe")).toBe("John D.");
    expect(formatUserName("Jane Ann Smith")).toBe("Jane S.");
  });

  it("should return single-part names as is", () => {
    expect(formatUserName("Madonna")).toBe("Madonna");
    expect(formatUserName("Plato")).toBe("Plato");
  });

  it("should handle empty strings correctly", () => {
    expect(formatUserName("")).toBeNull();
  });

  it("should return null for null or undefined inputs", () => {
    expect(formatUserName(null)).toBeNull();
    expect(formatUserName(undefined)).toBeNull();
  });
});
