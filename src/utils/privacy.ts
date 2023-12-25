const formatUserName = (name: string) => {
  let modifiedName = null;

  if (name) {
    const nameParts = name.split(" ");

    if (nameParts.length > 1) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      const abbreviatedLastName = lastName.charAt(0) + "."; // Keep only the first letter of the last name

      modifiedName = `${firstName} ${abbreviatedLastName}`;
    } else {
      modifiedName = nameParts[0];
    }
  }

  return modifiedName;
};

export { formatUserName };
