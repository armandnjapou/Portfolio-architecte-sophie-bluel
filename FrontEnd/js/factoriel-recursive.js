const doSomething = (n) => {
    if (n == 0 || n == 1) return 1;
    return n * doSomething(n - 1);
}
