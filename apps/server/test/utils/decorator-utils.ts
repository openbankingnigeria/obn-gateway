export function checkClassDecorator(target: any, decorator: any): boolean {
  return Reflect.getMetadataKeys(target).some(
    key => key === decorator.name,
  );
}

export function checkMethodDecorator(
  target: any,
  propertyKey: string,
  decorator: any,
): boolean {
  return Reflect.getMetadataKeys(target, propertyKey).some(
    key => key === decorator.name,
  );
}