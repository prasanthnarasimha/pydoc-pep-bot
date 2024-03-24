
# PEP Lookup Chatbot

This Python chatbot allows you to look up Python Enhancement Proposals (PEPs) related to specific Python operators and functions. It generates detailed summaries for each operator/function using the content of the related PEPs as context.

## Setup

1. Install dependencies:

```
pipenv install
```


2. Set your OpenAI API key:

```
export OPENAI_API_KEY='your-api-key'
```


## Usage

Run the chatbot:

```
pipenv run python chatbot.py
```

Enter a comma-separated list of Python operators/functions at the prompt. The chatbot will look up related PEPs, scrape their content, and generate summaries for each operator/function.

Example:
```
Enter a comma-separated list of Python operators/functions: init, @property

Looking up related PEPs for: ['init', '@property']
Found related PEPs: [412, 8]
Generating summaries...

Summaries:
init:
... summary ...

@property:
... summary ...

```

```
Enter a comma-separated list of Python operators/functions: 
reduce,walrusoperator
Looking up related PEPs for: ['reduce', 'walrusoperator']
Found related PEPs: {'reduce': 'PEP 309', 'walrusoperator': 'PEP 572'}
Generating summaries...

Summaries:
reduce:
General description:

The reduce function in Python takes a function and an iterable as arguments, applying the function cumulatively to the items of the iterable, from left to right, so as to reduce the iterable to a single value.
Code examples:

{'Example 1': {'Description': 'Summing up a list of numbers using reduce', 'Code': 'from functools import reduce\n\nnumbers = [1, 2, 3, 4, 5]\nsum_result = reduce(lambda x, y: x + y, numbers)\nprint(sum_result)'}, 'Example 2': {'Description': 'Finding the maximum number in a list using reduce', 'Code': 'from functools import reduce\n\nnumbers = [13, 25, 9, 17, 4]\nmax_number = reduce(lambda x, y: x if x > y else y, numbers)\nprint(max_number)'}}
Best practices and anti-patterns:

{'Best practices': ['Use reduce when you need to apply a function cumulatively to the items of an iterable.', 'Ensure the function provided is associative, commutative, and has no side effects for predictable results.'], 'Anti-patterns': ['Avoid using reduce for simple operations that can be done more clearly with loops or built-in functions like sum() or max().', 'Be cautious when using reduce with complex functions as it might reduce readability and maintainability.']}
Summary of additions/changes in PEPs:

{'PEP 279': 'Introduced reduce() as a built-in function in Python, available in the functools module.', 'PEP 3099': 'Further clarified that reduce() is available in the functools module and is used for performing an associative reduction.'}

walrusoperator:
General description:

The walrus operator (:=) introduced in Python 3.8 allows assignment expressions, enabling assignment within expressions, such as while loops, if statements, and list comprehensions.
Code examples:

{'Example 1': {'Description': 'Using the walrus operator to avoid redundant computation', 'Code': "if (n := len(data)) > 10:\n    print(f'Too many elements: {n}, expected <= 10')"}, 'Example 2': {'Description': 'Using the walrus operator in list comprehension', 'Code': 'new_numbers = [x for x in numbers if (square := x**2) > 10]'}}
Best practices and anti-patterns:

{'Best practices': ['Employ the walrus operator when you need to assign a subexpression to a variable and use it later in the same expression for readability and efficiency.', 'Use the walrus operator sparingly to enhance readability and maintainability of the code.'], 'Anti-patterns': ['Avoid excessive nesting of expressions when using the walrus operator as it can reduce code clarity.', 'Refrain from using the walrus operator in places where simple assignment or separate conditional statements suffice.']}
Summary of additions/changes in PEPs:

{'PEP 572': 'Introduced the assignment expressions syntax (walrus operator) to allow assignment within expressions, aiming to improve readability and reduce duplication in Python code.'}
```