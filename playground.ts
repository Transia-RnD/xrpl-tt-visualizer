import * as ts from "typescript";
// import * as fs from "fs";
import { TRANSACTION_TYPES } from "@transia/ripple-binary-codec";
// console.log(TRANSACTION_TYPES);

// Function to extract flag properties and their values from a flag enum
export function extractFlagPropertiesAndValues(
  sourceFile: any,
  flagEnumName: string
): Record<string, number> {
  const flagProperties: Record<string, number> = {};

  // Find the flag enum declaration
  const flagEnumDeclaration = sourceFile.statements.find(
    (stmt: any): stmt is ts.EnumDeclaration =>
      ts.isEnumDeclaration(stmt) && stmt.name.text === flagEnumName
  ) as ts.EnumDeclaration | undefined;

  if (flagEnumDeclaration) {
    flagEnumDeclaration.members.forEach((member) => {
      if (ts.isEnumMember(member)) {
        const propertyName = member.name.getText(sourceFile);
        // Try to get the initializer value if it exists
        const initializer = member.initializer;
        let value: number | undefined;
        if (initializer && ts.isNumericLiteral(initializer)) {
          value = parseInt(initializer.text, 10);
        } else if (
          initializer &&
          ts.isPrefixUnaryExpression(initializer) &&
          ts.isNumericLiteral(initializer.operand)
        ) {
          // Handle negative numbers
          value = -parseInt(initializer.operand.text, 10);
        }
        if (value !== undefined) {
          flagProperties[propertyName] = value;
        }
      }
    });
  }

  return flagProperties;
}

// Function to extract required and optional properties from an interface
export function extractProperties(
  sourceFile: any,
  interfaceName: string,
  interfaceDeclaration: ts.InterfaceDeclaration
): {
  properties: Record<string, { type: string; optional: boolean }>;
  flags?: Record<string, number>;
} {
  const properties: Record<string, { type: string; optional: boolean }> = {};
  let flags: Record<string, number> | undefined;

  interfaceDeclaration.members.forEach((member) => {
    if (ts.isPropertySignature(member)) {
      const propertyName = member.name.getText(sourceFile);
      const optional = !!member.questionToken; // Property is optional if it has a question mark
      let type = "any"; // Default to "any" if we can't determine the type

      if (member.type) {
        type = member.type.getText(sourceFile);
      }

      if (propertyName === "Flags") {
        type = "number";
      }

      if (propertyName === "TransactionType") {
        type = "string";
      }

      properties[propertyName] = { type, optional };

      if (propertyName === "Flags") {
        const flagEnumName = `${interfaceName}Flags`;
        flags = extractFlagPropertiesAndValues(sourceFile, flagEnumName);
      }
    }
  });

  return { properties, flags };
}

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

// Main function to process the interface and extract its details
export function processInterface(interfaceName: string) {
  // Path to the file containing the interfaces
  const filename = lowercaseFirstLetter(interfaceName)
  console.log(filename);
  
  // const filePath =
  // `/Users/denisangell/projects/xrpl-labs/xrpl.js/packages/xrpl/src/models/transactions/${lowercaseFirstLetter(interfaceName)}.ts`;

  // // Read the file content
  // const fileContent = fs.readFileSync(filePath, "utf8");

  // // Parse the file content to create a SourceFile object
  // const sourceFile = ts.createSourceFile(
  //   "transactions.ts",
  //   fileContent,
  //   ts.ScriptTarget.Latest,
  //   true
  // );
  // const details: {
  //   properties: Record<string, { type: string; optional: boolean }>;
  //   flags?: Record<string, number>;
  // } = { properties: {} };

  // // Find the interface declaration
  // const interfaceDeclaration = sourceFile.statements.find(
  //   (stmt): stmt is ts.InterfaceDeclaration =>
  //     ts.isInterfaceDeclaration(stmt) && stmt.name.text === interfaceName
  // ) as ts.InterfaceDeclaration | undefined;

  // if (interfaceDeclaration) {
  //   // Extract properties and flags
  //   const propertiesInfo = extractProperties(
  //     sourceFile,
  //     interfaceName,
  //     interfaceDeclaration
  //   );
  //   details.properties = propertiesInfo.properties;
  //   if (propertiesInfo.flags) {
  //     details.flags = propertiesInfo.flags;
  //   }
  // }
  // return details;
}

for (let index = 0; index < TRANSACTION_TYPES.length; index++) {
  const tt = TRANSACTION_TYPES[index];
  console.log(tt);
  
  
}
// Execute the main function and log the result
// const result = processInterface("OfferCreate");
// console.log(result);
