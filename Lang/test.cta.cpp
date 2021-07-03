
// std::vector<int> v { 10, 20, 30 };

// transform(v.begin(), v.end(), v.begin(), [](int &c){ return c * 2; });

// for (int a : v) {
//     print(a); print(" ");
// }

#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>
#include <vector>
#include <unistd.h>
#include "./headers/utils.h"
using namespace std;

string print(string i       ) { cout << i; return i; }
float  print(float i        ) { cout << i; return i; }
template <class T>
string print(vector<T> i    ) { string r = Array::toString(i); cout << r; return r; }

string input(string i) { cout << i; string _retstr; getline(cin, _retstr); return _retstr; }

float  _sum(float a , float b ) { return a + b; }
string _sum(string a, float b ) { return to_string(b) + a; }
string _sum(float a , string b) { return to_string(a) + b; }
string _sum(string a, string b) { return a + b; }

float  _sub(float a , float b ) { return a - b; }
// string _sub(string a, float b ) { return a + to_string(b); }
// string _sub(float a , string b) { return to_string(a) + b; }
// string _sub(string a, string b) { return a + b; }

float  _mul(float a , float b ) { return a * b; }
string _mul(string a, int b   ) { string r = ""; for (int c = 0; c < b; c++) { r += a; } return r; }

int _eql(float a , float b ) { return a == b; }
int _eql(string a, string b) { return a == b; }

int _lss(float a , float b ) { return a < b; }
int _lss(string a, string b) { return a.length() < b.length(); }

int _leq(float a , float b ) { return a <= b; }
int _meq(float a , float b ) { return a >= b; }

int _mrr(float a , float b ) { return a > b; }
int _mrr(string a, string b) { return a.length() > b.length(); }

void sleep(int milliseconds) { cout << flush; usleep(milliseconds * 1000); }

string a = string("Hello!");

int main() {
    // variable `a`;
    print(length());
    std::cout << '\n';
    return 0;
}