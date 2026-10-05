"""
Master Project Runner
Executes the full end-to-end BDA pipeline:
1. Cleans raw Amazon catalog
2. Generates scaled campaign & feedback logs
3. Trains and benchmarks ML models
4. Runs automated unit tests
5. Optionally starts Streamlit dashboard
"""

import os
import sys
import subprocess
import argparse

import src.data_pipeline as dp
import src.model_training as mt


def main():
    parser = argparse.ArgumentParser(description="BDA Marketing Campaign Project Runner")
    parser.add_argument("--skip-data", action="store_true", help="Skip data cleaning and log generation")
    parser.add_argument("--skip-train", action="store_true", help="Skip model training")
    parser.add_argument("--run-tests", action="store_true", help="Run unit test suite")
    parser.add_argument("--serve", action="store_true", help="Launch Streamlit web application")
    args = parser.parse_args()

    print("======================================================================")
    print("  BDA PROJECT: AUTOMATED CONTENT GENERATION FOR MARKETING CAMPAIGNS   ")
    print("======================================================================")

    # Step 1 & 2: Data Pipeline
    if not args.skip_data:
        print("\n[Step 1/3] Processing Amazon Catalog & Generating Feedback Logs...")
        raw_csv = "amazon.csv"
        clean_csv = "data/amazon_cleaned.csv"
        clean_parquet = "data/amazon_cleaned.parquet"
        
        df_catalog = dp.clean_amazon_catalog(raw_csv, clean_csv, clean_parquet)
        print(f"-> Ingested and cleaned {len(df_catalog)} products from amazon.csv.")
        
        df_campaigns = dp.generate_campaign_feedback_dataset(
            df_catalog,
            num_samples=6500,
            output_csv_path="data/campaign_feedback_logs.csv",
            output_parquet_path="data/campaign_feedback_logs.parquet"
        )
        print(f"-> Generated {len(df_campaigns)} campaign logs with user inputs and feedback ratings.")
    else:
        print("\n[Step 1/3] Skipping data generation (using existing data files).")

    # Step 3: Model Training
    if not args.skip_train:
        print("\n[Step 2/3] Training and Benchmarking Machine Learning Classifiers...")
        metadata = mt.train_and_evaluate_models()
        print(f"-> Best Classifier: {metadata['best_model']}")
    else:
        print("\n[Step 2/3] Skipping model training (using existing model checkpoint).")

    # Step 4: Tests
    if args.run_tests:
        print("\n[Step 3/3] Running Automated Unit Tests...")
        res = subprocess.run([sys.executable, "test_pipeline.py"])
        if res.returncode == 0:
            print("-> All unit tests PASSED successfully!")
        else:
            print("-> Some unit tests failed.")

    print("\n======================================================================")
    print("  PIPELINE EXECUTION COMPLETE! ALL ARTIFACTS ARE READY.               ")
    print("======================================================================")
    print("To launch the interactive Streamlit dashboard, run:")
    print("    streamlit run app.py")
    print("======================================================================")

    if args.serve:
        print("\nLaunching Streamlit Web App...")
        subprocess.run(["streamlit", "run", "app.py"])


if __name__ == '__main__':
    main()
