import random
import string

"""
Generates a random id.
"""
def id_gen():
  return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(6))