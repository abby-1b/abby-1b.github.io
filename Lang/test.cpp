
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

using namespace std;

class String {
    public:
        static int toint(string a) {
            try {
                return stoi(a);
            } catch (...) {
                return 0;
            }
        }

        static string lower(string a) {
            transform(a.begin(), a.end(), a.begin(), [](unsigned char c){ return tolower(c); });
            return a;
        }

        static string upper(string a) {
            transform(a.begin(), a.end(), a.begin(), [](unsigned char c){ return toupper(c); });
            return a;
        }

        static int length(string a) {
            return a.length();
        }
};

class Vector {
};

string print(string i) { cout << i; return i; }
float  print(float i)  { cout << i; return i; }

string input(string i) { cout << i; string _retstr; getline(cin, _retstr); return _retstr; }

float  _sum(float a , float b ) { return a + b; }
string _sum(string a, float b ) { return to_string(b) + a; }
string _sum(float a , string b) { return to_string(a) + b; }
string _sum(string a, string b) { return a + b; }

float  _sub(float a , float b ) { return a - b; }
// string _sub(string a, float b ) { return to_string(b) + a; }
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

int number = String::toint(input(string("Enter the number of terms: ")));
int n1 = 0;
int n2 = 1;
int nextTerm;

int main() {
    // variable `number`;
    // variable `n1`;
    // variable `n2`;
    // variable `nextTerm`;
    print(string("\nFibonacci: \n"));
    for (int a = 0; _lss(a, number); a++) {
        print(n1); print(" "); print(string(""));
        nextTerm = _sum(n1, n2);
        n1 = n2;
        n2 = nextTerm;
    }
    std::cout << '\n';
    return 0;
}
