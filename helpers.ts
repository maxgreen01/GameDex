
const exportedMethods = {
  checkString(strVal: string, fieldName: string) {
    if (!strVal) throw new Error(`${fieldName} was not supplied.`);
    if (typeof strVal !== 'string') throw new Error(`${fieldName} must be a string!`);
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw new Error(`${fieldName} cannot be an empty string or a string with just spaces`);
    return strVal;
  }
};

export default exportedMethods;