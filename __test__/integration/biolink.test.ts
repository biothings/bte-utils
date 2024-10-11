import { biolink } from "../../src/biolink";

describe("Test BioLinkModel class", () => {
  test("test reverse with correct predicate", () => {
    const res = biolink.reverse("treats");
    expect(res).toBe("treated_by");
  });

  test("test reverse with correct predicate if it contains underscore", () => {
    const res = biolink.reverse("treated_by");
    expect(res).toBe("treats");
  });

  test("test reverse with predicate having symmetric equal to true", () => {
    const res = biolink.reverse("correlated_with");
    expect(res).toBe("correlated_with");
  });

  test("test predicate with no inverse property and symmetric not equal to true", () => {
    const res = biolink.reverse("has_phenotype");
    expect(res).toBe("phenotype_of");
  });

  test("test predicate not exist in biolink model", () => {
    const res = biolink.reverse("haha");
    expect(res).toBeUndefined();
  });

  test("if input not string, return undefined", () => {
    //@ts-expect-error: Explicitly testing for wrong type
    const res = biolink.reverse(["dd"]);
    expect(res).toBeUndefined();
  });

  describe("Test getAncestorClasses method", () => {
    test("If input is in biolink model, return all its ancestors and itself", () => {
      const res = biolink.getAncestorClasses("MolecularEntity");
      expect(res).toContain("ChemicalEntity");
      expect(res).toContain("NamedThing");
      expect(res).toContain("MolecularEntity");
    });

    test("if input is in biolink model but doesn't have ancestors, return itself", () => {
      const res = biolink.getAncestorClasses("Entity");
      expect(res).toEqual(["Entity"]);
    });

    test("if input is not in biolink, return itself", () => {
      const res = biolink.getAncestorClasses("Gene1");
      expect(res).toEqual("Gene1");
    });
  });

  describe("Test getAncestorPredicates function", () => {
    test("if input is in biolink model, return all its ancestors and itself", () => {
      const res = biolink.getAncestorPredicates("subclass_of");
      expect(res).toContain("related_to_at_concept_level");
      expect(res).toContain("related_to");
      expect(res).toContain("subclass_of");
    });

    test("if input is in biolink model but doesn't have ancestors, return itself", () => {
      const res = biolink.getAncestorPredicates("related_to");
      expect(res).toEqual(["related_to"]);
    });

    test("if input is not in biolink, return itself", () => {
      const res = biolink.getAncestorPredicates("Predicate1");
      expect(res).toEqual("Predicate1");
    });
  });

  describe("Test getDescendants function", () => {
    test("if input is in biolink model, return all its desendants and itself", () => {
      const res = biolink.getDescendantClasses("MolecularEntity");
      expect(res).toContain("SmallMolecule");
      expect(res).toContain("NucleicAcidEntity");
      expect(res).toContain("MolecularEntity");
    });

    test("if input is in biolink model but doesn't have descendants, return itself", () => {
      const res = biolink.getDescendantClasses("Gene");
      expect(res).toEqual(["Gene"]);
    });

    test("if input is not in biolink, return itself", () => {
      const res = biolink.getDescendantClasses("Gene1");
      expect(res).toEqual("Gene1");
    });
  });

  describe("Test getDescendantPredicates function", () => {
    test("if input is in biolink model, return all its desendants and itself", () => {
      const res = biolink.getDescendantPredicates("related_to");
      expect(res).toContain("subclass_of");
      expect(res).toContain("superclass_of");
      expect(res).toContain("related_to");
    });

    test("if input is in biolink model but doesn't have descendants, return itself", () => {
      const res = biolink.getDescendantPredicates("subclass_of");
      expect(res).toEqual(["subclass_of"]);
    });

    test("if input is not in biolink, return itself", () => {
      const res = biolink.getDescendantPredicates("Gene1");
      expect(res).toEqual(["Gene1"]);
    });
  });

  describe("Test getDescendantQualifiers function", () => {
    // TODO figure out what's going on with this
    test.skip("if input is in biolink model, return all its desendants and itself", () => {
      const res = biolink.getDescendantQualifiers("context_qualifier");
      expect(res).toContain("object_context_qualifier");
      expect(res).toContain("subject_context_qualifier");
      expect(res).toContain("context_qualifier");
    });

    test("if input is in biolink model but doesn't have descendants, return itself", () => {
      const res = biolink.getDescendantQualifiers("object_context_qualifier");
      expect(res).toEqual(["object_context_qualifier"]);
    });

    test("if input is not in biolink, return itself", () => {
      const res = biolink.getDescendantQualifiers("Qualifier1");
      expect(res).toEqual(["Qualifier1"]);
    });
  });
});
