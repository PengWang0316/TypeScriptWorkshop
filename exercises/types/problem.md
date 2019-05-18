# TYPES in TypeScript

TypeScript gives users ability to define types for variables, function parameters as well as return values.
Some commone data types include: **number, string, boolean, enum, void, null, undefined, any, never, Array, and tuple**.

**Example for creating a boolean type variable**
```typescript
const isPass: boolean = false;
```

**Example for definding a boolean type for function parameter**
```typescript
function setPass(isPass : boolean) {
  console.log(isPass);
}
```

**Example for definding a string type for return value**
```typescript
function setPass(isPass : boolean) : string {
  if (isPass) return 'pass';
  return 'block';
}
```

# EXERCISE

1. Create a **number** variable `num` and set its value to 100.

2. Create a `printNum` function to take a **number** type paramter `numA` and define the return type as **string**.

3. The function should return the string version of num you passed in.

--
## HINTS

To create a TypeScript file, create a new file `types.ts` and write your solution in the file. When you are done, you must run:

```sh
$ typescripting verify types.ts
```

to proceed. Your script will be tested, a report will be generated, and the lesson will be marked 'completed' if you are successful.