import os
import json
import requests
from bs4 import BeautifulSoup
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def get_related_peps(operators: str) -> list:
    """
    Takes a comma-separated list of Python operators/functions and returns 
    a list of closely related Python Enhancement Proposals (PEPs).
    """
    system_prompt = f"""
    You are an AI assistant that specializes in looking up Python Enhancement Proposals (PEPs) 
    related to specific Python operators and functions. 
    Given the following comma-separated list of operators/functions, please return the PEP numbers
    that are most closely related to each one as a JSON array. If no closely related PEPs are found, return an empty array.
    
    Operators/functions: {operators}
    """
    response = client.chat.completions.create(model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": system_prompt},
    ])

    pep_numbers = json.loads(response.choices[0].message.content)
    return pep_numbers

def scrape_pep_content(pep_number: int) -> str:
    """
    Scrapes the content of a PEP webpage given its number.
    """
    url = f"https://peps.python.org/pep-{pep_number}/"
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        pep_content = soup.get_text()
    else:
        pep_content = ""
        
    return pep_content

def generate_summary(operators: str, pep_numbers: list) -> dict:
    """
    Generates a summary for each operator/function in the input list,
    using the content of related PEPs as context.
    """
    pep_contents = [scrape_pep_content(num) for num in pep_numbers]
    pep_context = "\n\n".join(pep_contents)
    
    system_prompt = f"""
    You are an AI coding assistant that generates detailed summaries of Python operators and functions,
    using related Python Enhancement Proposals (PEPs) as context.
    
    For each operator/function in the following comma-separated list, please generate a human readable summary that includes:
    1. General description 
    2. Code examples
    3. Best practices and anti-patterns
    4. Summary of additions/changes in the provided PEPs
    
    Format the output as a JSON object mapping each operator/function to its summary.
    The key of the JSON should be the operator/function and value of the JSON should be a human readable format of all required things mentiond above
    
    Operators/functions: {operators}
    
    PEP Context:
    {pep_context}
    """
    
    response = client.chat.completions.create(model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": system_prompt},
    ])
    
    summary = json.loads(response.choices[0].message.content)
    return summary

def main():
    operators = input("Enter a comma-separated list of Python operators/functions: ")
    # operators = print("Enter a comma-separated list of Python operators/functions: ")
    # operators = "reduce,walrusoperator"
    print(operators)
    operators = [op.strip() for op in operators.split(",")]
    
    print(f"Looking up related PEPs for: {operators}")
    pep_numbers = get_related_peps(", ".join(operators))
    
    if len(pep_numbers) == 0:
        print("No related PEPs found.")
    else:
        print(f"Found related PEPs: {pep_numbers}")
        print("Generating summaries...")
        summaries = generate_summary(", ".join(operators), pep_numbers)
        
        print("\nSummaries:")
        for operator, summary in summaries.items():
            print(f"{operator}:")
            for title,desc in summary.items():
                print(f"{title}:")
                print()
                print(desc)
            print()
        
if __name__ == "__main__":
    main()