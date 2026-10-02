<div align="center">

# 💳 Credit Risk ML System

### AI-Powered Credit Risk Assessment & Prediction Platform

<p>
  <img src="https://img.shields.io/badge/Python-3.14-blue?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/XGBoost-Machine%20Learning-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Scikit--learn-ML-orange?style=for-the-badge&logo=scikit-learn&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/HTML5-Frontend-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-Frontend-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Pandas-Data%20Analysis-150458?style=flat-square&logo=pandas&logoColor=white" />
  <img src="https://img.shields.io/badge/NumPy-Data%20Processing-013243?style=flat-square&logo=numpy&logoColor=white" />
</p>

<p>
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&duration=2500&pause=800&color=00D9FF&center=true&vCenter=true&width=750&lines=AI-Powered+Credit+Risk+Assessment;Machine+Learning+%7C+XGBoost+%7C+FastAPI;Predict+%7C+Analyze+%7C+Assess+Risk;From+Raw+Data+to+Production+API" />
</p>

</div>

---

## 📌 Overview

**Credit Risk ML System** is an end-to-end Machine Learning application designed to estimate the probability of credit/loan default from applicant and loan information.

The system combines:

- 📊 Data preprocessing
- 🧹 Data cleaning
- 🤖 Machine Learning
- ⚡ FastAPI REST API
- 🌐 Interactive web interface
- 📈 Probability-based risk assessment
- 🔍 Input validation
- 🚀 Production-style deployment structure

The trained ML pipeline processes applicant information and produces a probability-based credit risk prediction.

> **Important:** This project is intended for educational and research purposes. A machine-learning prediction should not be used as the sole basis for real-world lending or financial decisions.

---

# 🎯 Project Objective

The main objective of this project is to build a complete ML-powered system that can:

1. Accept applicant and loan information.
2. Validate the submitted information.
3. Preprocess numerical and categorical features.
4. Generate a probability of default.
5. Convert the probability into a risk classification.
6. Return the prediction through a REST API.
7. Display the result through an interactive web interface.

---

# 🧠 Machine Learning Pipeline

```text
                    ┌──────────────────────┐
                    │     User Input       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Input Validation     │
                    │      Pydantic        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Data Preprocessing │
                    │                      │
                    │ • Missing Values     │
                    │ • Encoding           │
                    │ • Feature Processing │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      XGBoost         │
                    │   ML Classification  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Probability Estimate │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Risk Assessment    │
                    │                      │
                    │  Low / High Risk     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Web Dashboard      │
                    └──────────────────────┘
