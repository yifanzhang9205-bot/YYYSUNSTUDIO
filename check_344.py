#!/usr/bin/env python3
with open('App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
    for i in range(335, 355):
        print(f"{i+1}: {lines[i].rstrip()}")
