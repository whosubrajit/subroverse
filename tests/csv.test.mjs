import assert from "node:assert/strict"
import test from "node:test"
import { csvCell } from "../src/lib/csv.ts"

test("CSV cells escape quotes, commas and line breaks", () => {
  assert.equal(csvCell('A, "quoted" value'), '"A, ""quoted"" value"')
  assert.equal(csvCell("line one\nline two"), '"line one\nline two"')
})

test("spreadsheet formula prefixes are neutralized, including leading whitespace", () => {
  for (const value of ["=1+1", "+1+1", "-1+1", "@SUM(1)", "  =1+1", "\t=1+1", "\r=1+1", "\ntext", "\u0000=1+1"]) {
    assert.ok(csvCell(value).startsWith('"\''), value)
  }
  assert.equal(csvCell("reader@gmail.com"), '"reader@gmail.com"')
  assert.equal(csvCell("welcome-modal"), '"welcome-modal"')
})
