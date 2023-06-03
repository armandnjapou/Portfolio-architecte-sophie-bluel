const doSomething = () => {
  return Array.from({ length: n }, (_,i) => i + 1).reduce((acc, curr) => acc * curr, 1);
}
